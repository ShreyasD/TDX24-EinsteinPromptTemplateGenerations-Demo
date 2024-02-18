import { LightningElement, api } from 'lwc';

export default class PropertySendListingsModalDetails extends LightningElement {
    @api properties;
    @api clientId;

    //TODO add client to propertylistmap
}