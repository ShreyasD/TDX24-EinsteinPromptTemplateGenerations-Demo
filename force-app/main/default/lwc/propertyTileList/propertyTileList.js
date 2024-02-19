import { 
    LightningElement, 
    wire, 
    api 
} from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PropertySendListingsModal from 'c/propertySendListingsModal';

import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';

const PAGE_SIZE = 9;
const SEND_EMAIL_PROPERY_SELECTION_LIMIT = 3;

export default class PropertyTileList extends LightningElement {
    //pagination
    pageNumber = 1;
    pageSize = PAGE_SIZE;

    //search filters
    searchKey = '';
    maxPrice = 9999999;
    minBedrooms = 0;
    minBathrooms = 0;

    //selections
    @api allowSelectionLimit = SEND_EMAIL_PROPERY_SELECTION_LIMIT;
    selectedCount = 0;
    selectedPropertyList = [];

    //guidance text
    guidanceText;

    @wire(MessageContext)
    messageContext;

    @wire(getPagedPropertyList, {
        searchKey: '$searchKey',
        maxPrice: '$maxPrice',
        minBedrooms: '$minBedrooms',
        minBathrooms: '$minBathrooms',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    properties;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange(message);
            }
        );

        //Set guidance tex
        this.guidanceText = "Please select using right-click <strong>" + this.allowSelectionLimit + 
        "</strong> properties to send to prospective clients.";
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.maxPrice = filters.maxPrice;
        this.minBedrooms = filters.minBedrooms;
        this.minBathrooms = filters.minBathrooms;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    handlePropertySelected(event) {
        //get selected property
        let propertyId = event.detail;
        let propertyTile = this.template.querySelector('c-property-tile[data-id="' + propertyId +'"]');
        
        //check if selected count within allowed limit
        if(this.selectedCount < this.allowSelectionLimit || propertyTile.isSelected) {
            //update selected list
            if(propertyTile.isSelected) {
                this.selectedPropertyList = this.selectedPropertyList.filter(x => x.Id !== propertyId);
                this.selectedCount--;
            } else {
                this.selectedPropertyList.push(this.properties.data.records.find((x) => x.Id === propertyId));
                this.selectedCount++;
            }

            propertyTile.toggleSelect();
        } else {
            this.showToast("Warning!", "Maximum of " + this.allowSelectionLimit + " properties of allowed for client email.", "warning");
        }
    }

    handlePropertyClick(event) {
        //send event to update other components
        const message = { propertyId: event.detail };
        publish(this.messageContext, PROPERTYSELECTEDMC, message);
    }

    async handleSendListings() {
        console.log("handleSendListings: " + JSON.stringify(this.selectedPropertyList));
        if(this.selectedCount === this.allowSelectionLimit) {
            const result = await PropertySendListingsModal.open({
                // `label` is not included here in this example.
                // it is set on lightning-modal-header instead
                size: 'large',
                description: 'Guided flow for sending prospecting email for interested listings for Contacts or Leads.',
                properties: this.selectedPropertyList,
            });
            // if modal closed with X button, promise returns result = 'undefined'
            // if modal closed with OK button, promise returns result = 'okay'
            console.log(result);
        } else {
            this.showToast("Warning!", "Please select " + this.allowSelectionLimit + " propertiese to send to client.", "warning");
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
