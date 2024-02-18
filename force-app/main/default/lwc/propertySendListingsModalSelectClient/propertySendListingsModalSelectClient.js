import { LightningElement, api } from 'lwc';

export default class PropertySendListingsModalSelectClient extends LightningElement {
    @api get clientId() {
        return this.currentSelectedRecordId;
    }

    //record picker configuration
    targetObjects = [
        {
            label: 'Contact',
            value: 'Contact'
        },
        {
            label: 'Lead',
            value: 'Lead'
        }
    ];
    selectedTarget = 'Contact';
    currentSelectedRecordId = null;

    get showTargetSelector() {
        return this.currentSelectedRecordId === null;
    }


    handleTargetSelection(event) {
        // Prevent lightning-combobox `change` event from bubbling
        event.stopPropagation();

        this.selectedTarget = event.target.value;
        this.refs.recordPicker.clearSelection();
    }

    handleRecordSelect(event) {
        this.currentSelectedRecordId = event.detail.recordId;
    }
}