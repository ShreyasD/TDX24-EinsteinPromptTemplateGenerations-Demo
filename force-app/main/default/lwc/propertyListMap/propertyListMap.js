/* global L */
import { LightningElement, wire, api } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import findObjectNameFromRecordId from '@salesforce/apex/ObjectUtilities.findObjectNameFromRecordId';


import FILTERS_CHANGED from '@salesforce/messageChannel/FiltersChange__c';
import PROPERTY_SELECTED from '@salesforce/messageChannel/PropertySelected__c';
import LEAFLET from '@salesforce/resourceUrl/leafletjs';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';

//Contact Fields
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import CONTACT_NAME from '@salesforce/schema/Contact.Name';
import CONTACT_PHONE from '@salesforce/schema/Contact.Phone';
import CONTACT_MAILINGLATITUDE from '@salesforce/schema/Contact.MailingLatitude';
import CONTACT_MAILINGLONGITUDE from '@salesforce/schema/Contact.MailingLongitude';

//Lead Fields
import LEAD_ID from '@salesforce/schema/Lead.Id';
import LEAD_NAME from '@salesforce/schema/Lead.Name';
import LEAD_PHONE from '@salesforce/schema/Lead.Phone';
import LEAD_LATITUDE from '@salesforce/schema/Lead.Latitude';
import LEAD_LONGITUDE from '@salesforce/schema/Lead.Longitude';

const CONTACT_FIELDS = [CONTACT_ID, CONTACT_NAME, CONTACT_PHONE, CONTACT_MAILINGLATITUDE, CONTACT_MAILINGLONGITUDE];
const LEAD_FIELDS = [LEAD_ID,LEAD_NAME,LEAD_PHONE,LEAD_LATITUDE,LEAD_LONGITUDE];

const LEAFLET_NOT_LOADED = 0;
const LEAFLET_LOADING = 1;
const LEAFLET_READY = 2;

export default class PropertyListMap extends LightningElement {
    @api clientId;
    @api properties = [];
    
    clientType;
    contact;
    lead;

    //client fields
    fields;
    clientLayer;

    // Map
    leafletState = LEAFLET_NOT_LOADED;
    map;
    propertyLayer;

    // Filters
    searchKey = '';
    maxPrice = null;
    minBedrooms = null;
    minBathrooms = null;
    pageNumber = null;
    pageSize = null;

    @wire(MessageContext)
    messageContext;

    @wire(getRecord, {recordId: '$clientId', fields: '$fields'})
    wiredClient({error, data}){
        if (data) {
            this.contact = (this.clientType === 'Contact') ? data : null;
            this.lead = (this.clientType === 'Lead') ? data : null;
            this.displayClient();
        } else if (error) {
            this.contact = null;
            this.lead = null;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading client',
                    message: error.message,
                    variant: 'error'
                })
            );
        }
    }

    @wire(getPagedPropertyList, {
        searchKey: '$searchKey',
        maxPrice: '$maxPrice',
        minBedrooms: '$minBedrooms',
        minBathrooms: '$minBathrooms',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    wiredProperties({ error, data }) {
        if (data) {
            this.properties = (this.properties.length === 0) ? data.records : this.properties;
            // Display properties on map
            this.displayProperties();
        } else if (error) {
            this.properties = [];
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading properties',
                    message: error.message,
                    variant: 'error'
                })
            );
        }
    }

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERS_CHANGED,
            (message) => {
                this.handleFilterChange(message);
            }
        );

        //get client details
        console.log('PropertyListMap->clientId: ' + this.clientId);
        findObjectNameFromRecordId({recordId: this.clientId})
            .then((result) => {
                this.clientType = result;
                if(result === 'Contact') {
                    this.fields = CONTACT_FIELDS;
                } else if (result === 'Lead') {
                    this.fields = LEAD_FIELDS;
                }
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading client location',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    async renderedCallback() {
        if (this.leafletState === LEAFLET_NOT_LOADED) {
            await this.initializeLeaflet();
        }
    }

    async initializeLeaflet() {
        try {
            // Leaflet is loading
            this.leafletState = LEAFLET_LOADING;

            // Load resource files
            await Promise.all([
                loadScript(this, `${LEAFLET}/leaflet.js`),
                loadStyle(this, `${LEAFLET}/leaflet.css`)
            ]);

            // Configure map
            const mapElement = this.template.querySelector('.map');
            this.map = L.map(mapElement, {
                zoomControl: true,
                tap: false
                // eslint-disable-next-line no-magic-numbers
            });
            this.map.setView([42.356045, -71.08565], 13);
            this.map.scrollWheelZoom.disable();
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            // Leaflet is ready
            this.leafletState = LEAFLET_READY;

            // Display properties
            this.displayProperties();
        } catch (error) {
            const message = error.message || error.body.message;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while loading Leaflet',
                    message,
                    variant: 'error'
                })
            );
        }
    }

    @api displayClient() {
        // Stop if leaflet isn't ready yet
        if (this.leafletState !== LEAFLET_READY) {
            return;
        }

        // Remove previous client layer from map if it exits
        if (this.clientLayer) {
            this.map.removeLayer(this.clientLayer);
        }

        // Prepare client icon
        const icon = L.divIcon({
            className: 'my-div-icon',
            html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 52 52"><path fill="#3240a8" d="m26 2c-10.5 0-19 8.5-19 19.1 0 13.2 13.6 25.3 17.8 28.5 0.7 0.6 1.7 0.6 2.5 0 4.2-3.3 17.7-15.3 17.7-28.5 0-10.6-8.5-19.1-19-19.1z m0 27c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path></svg>'
        });

        //Create client icon
        console.log('this.contact: ' + JSON.stringify(this.contact));
        console.log('this.lead: ' + JSON.stringify(this.lead));
        const lat = (this.clientType === 'Contact') ? this.contact.fields.MailingLatitude.value : this.lead.fields.Latitude.value;
        const lng = (this.clientType === 'Contact') ? this.contact.fields.MailingLongitude.value : this.lead.fields.Longitude.value;
        const name = (this.clientType === 'Contact') ? this.contact.fields.Name.value : this.lead.fields.Name.value;
        const phone = (this.clientType === 'Contact') ? this.contact.fields.Phone.value : this.lead.fields.Phone.value;
        console.log('lat: ' + lat + ' lng: ' + lng + ' name: ' + name + ' phone: ' + phone);
        
        const marker = L.marker([lat, lng], {icon});
        marker.clientId = this.clientId;
        marker.bindTooltip(this.getClientTooltipMarkup(name, phone), { offset: [45, -40] });

        //Create a layer and add to map
        this.clientLayer = L.layerGroup([marker]);
        this.clientLayer.addTo(this.map);
    }

    @api displayProperties() {
        // Stop if leaflet isn't ready yet
        if (this.leafletState !== LEAFLET_READY) {
            return;
        }

        // Remove previous property layer form map if it exits
        if (this.propertyLayer) {
            this.map.removeLayer(this.propertyLayer);
        }

        // Prepare property icon
        const icon = L.divIcon({
            className: 'my-div-icon',
            html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 52 52"><path fill="#DB4437" d="m26 2c-10.5 0-19 8.5-19 19.1 0 13.2 13.6 25.3 17.8 28.5 0.7 0.6 1.7 0.6 2.5 0 4.2-3.3 17.7-15.3 17.7-28.5 0-10.6-8.5-19.1-19-19.1z m0 27c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path></svg>'
        });

        // Prepare click handler for property marker
        const markerClickHandler = (event) => {
            // Send message using the Lightning Message Service
            const message = { propertyId: event.target.propertyId };
            publish(this.messageContext, PROPERTY_SELECTED, message);
        };

        // Prepare property markers
        const markers = this.properties.map((property) => {
            const latLng = [
                property.Location__Latitude__s,
                property.Location__Longitude__s
            ];
            const tooltipMarkup = this.getTooltipMarkup(property);
            const marker = L.marker(latLng, { icon });
            marker.propertyId = property.Id;
            marker.on('click', markerClickHandler);
            marker.bindTooltip(tooltipMarkup, { offset: [45, -40] });
            return marker;
        });


        // Create a layer with property markers and add it to map
        this.propertyLayer = L.layerGroup(markers);
        this.propertyLayer.addTo(this.map);
    }

    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.maxPrice = filters.maxPrice;
        this.minBedrooms = filters.minBedrooms;
        this.minBathrooms = filters.minBathrooms;
    }

    getTooltipMarkup(property) {
        return `<div class="tooltip-picture" style="background-image:url(${property.Thumbnail__c})">  
  <div class="lower-third">
    <h1>${property.Name}</h1>
    <p>Beds: ${property.Beds__c} - Baths: ${property.Baths__c}</p>
  </div>
</div>`;
    }

    getClientTooltipMarkup(name, phone) {
        return `<div class="client-tooltip-picture">
    <h1>${name}</h1>
    <p>Phone: ${phone}</p>
</div>`;
    }
}
