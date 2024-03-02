import { LightningElement, api } from 'lwc';

export default class PropertySendListingsModalDetails extends LightningElement {
    @api properties;
    @api clientId;

    connectedCallback() {
        console.log('PropertySendListingsModalDetails->clientId: ' + this.clientId);
    }
}