import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import generatePromptResponse from '@salesforce/apex/PromptUtility.generatePromptResponse';

export default class ResolveCaseInteractionSummaryGenAI extends LightningElement {
    @api recordId;
    caseInteractionSummaryValue = "";

    connectedCallback() {
        console.log("ResolveCaseInteractionSummary->recordId: " + this.recordId);

        //Request
        let promptRequest = {
            templateNameOrId: "0hfTC0000001OxxYAE",
            inputMap: {"Input:Case": this.recordId}
        }

        generatePromptResponse({request: promptRequest})
            .then((result) => {
                console.log("result: " + JSON.stringify(result));
                this.caseInteractionSummaryValue = result.generations[0].text;
            })
            .catch((error) => {
                console.log("error: " + JSON.stringify(error));
                const evt = new ShowToastEvent({
                    title: "ERROR",
                    message: this.error.message,
                    variant: "error"
                });
            });
        
    }

}