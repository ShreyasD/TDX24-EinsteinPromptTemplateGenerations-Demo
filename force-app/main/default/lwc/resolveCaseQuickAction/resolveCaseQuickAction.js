import { LightningElement, api, track } from 'lwc';
import ResolveCaseVerifyDetails from 'c/resolveCaseVerifyDetails';
import ResolveCaseInteractionSummary from 'c/resolveCaseInteractionSummary';

export default class ResolveCaseQuickAction extends LightningElement {
    @api recordId;

    //Wizard Status
    currentStep = 0;
    wizardSteps = [
        {cmp: ResolveCaseVerifyDetails, title: "Case Details", isCurrentStep: true, isComplete: false},
        {cmp: ResolveCaseInteractionSummary, title: "Case Interaction Summary", isCurrentStep: false, isComplete: false}
    ];

    stepComponent;
    stepComponentParams;

    get showPrevButton() {
        return (this.currentStep > 0);
    }

    connectedCallback() {
        console.log("currentStep: " + JSON.stringify(this.wizardSteps[this.currentStep]));
        this.stepComponent = this.wizardSteps[this.currentStep].cmp;
        this.stepComponentParams = { caseRecordId: this.recordId };
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
        this.stepComponentParams = { caseRecordId: this.recordId };
    }
}