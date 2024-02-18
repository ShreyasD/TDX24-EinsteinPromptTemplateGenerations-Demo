import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import PropertySendListingsModalDetails from 'c/propertySendListingsModalDetails';
import PropertySendListingsModalSelectClient from 'c/propertySendListingsModalSelectClient';

export default class PropertySendListingsModal extends LightningModal {
    @api properties;
    @api clientId;

    //Wizard Status
    currentStep = 0;
    wizardSteps = [
        {cmp: PropertySendListingsModalSelectClient, title: "Select Lead or Contact", isCurrentStep: true, isComplete: false},
        {cmp: PropertySendListingsModalDetails, title: "Validate Property Details", isCurrentStep: false, isComplete: false},
        {cmp: null, title: "Generate and Send Email", isCurrentStep: false, isComplete: false}
    ];

    //wizard component
    stepComponent;
    stepComponentParams;

    get showPrevButton() {
        return (this.currentStep > 0);
    }

    connectedCallback() {
        this.stepComponent = this.wizardSteps[this.currentStep].cmp;
        this.stepComponentParams = {};
    }

    handleNext(event) {
        console.log('handleNext');
        this.updateWizardState("next");
    }

    handlePrevious(event) {
        console.log('handlePrevious');
        this.updateWizardState("previous");
    }

    updateWizardState(direction) {
        //get api properties
        if(this.stepComponent === PropertySendListingsModalSelectClient) {
            this.clientId = this.refs.currentStep.clientId;
        }

        //complete last step
        this.wizardSteps[this.currentStep].isCurrentStep = false;
        this.wizardSteps[this.currentStep].isComplete = true;

        //update counter
        this.currentStep = (direction == "next") ? this.currentStep+1 : 
            (direction == "previous") ? this.currentStep-1 : this.currentStep;

        //update state
        this.wizardSteps[this.currentStep].isCurrentStep = true;
        
        //update UI
        this.stepComponent = this.wizardSteps[this.currentStep].cmp;

        //Set component parameters
        if(this.stepComponent == PropertySendListingsModalDetails) {
            this.stepComponentParams = {
                clientId: this.clientId, 
                properties: this.properties
            };
        }
    }
}