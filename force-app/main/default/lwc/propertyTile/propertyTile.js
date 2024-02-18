import { LightningElement, api } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';
import { NavigationMixin } from 'lightning/navigation';

export default class PropertyTile extends NavigationMixin(LightningElement) {
    @api property;
    selected = false;
    formFactor = FORM_FACTOR;

    @api
    get isSelected() {
        return this.selected;
    }

    @api toggleSelect() {
        this.selected = !this.selected;

        //Change style to selected
        let tile = this.refs.propertyTile;
        if(this.selected) {
            tile.classList.add("selected");
        } else {
            tile.classList.remove("selected");
        }
    }

    handlePropertySelected(evt) {
        if (this.formFactor === 'Small') {
            // In Phones, navigate to property record page directly
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.property.Id,
                    objectApiName: 'Property__c',
                    actionName: 'view'
                }
            });
        } else {
            // In other devices, send message to other cmps on the page
            const selectedEvent = new CustomEvent('clicked', {
                detail: this.property.Id
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    handleRightClick(evt) {
        //prevent context menu
        evt.preventDefault();

        //send message to parent
        const rightClickEvent = new CustomEvent('selected', {
            detail: this.property.Id
        });
        this.dispatchEvent(rightClickEvent);
    }

    get backgroundImageStyle() {
        return `background-image:url(${this.property.Thumbnail__c})`;
    }
}
