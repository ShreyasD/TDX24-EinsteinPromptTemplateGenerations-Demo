import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import generateMessageFromPromptTemplate from '@salesforce/apex/EinsteinGenAIGatewayService.generateMessageFromPromptTemplate';

export default class ResolveCaseInteractionSummaryGenAI extends LightningElement {
    @api recordId;
    caseInteractionSummaryValue = "";

    connectedCallback() {
        console.log("ResolveCaseInteractionSummary->recordId: " + this.recordId);

        //Request
        let promptRequest = {
            templateNameOrId: "Case_Interaction_Summary",
            inputMap: {"Input:Case": this.recordId}
        }

        generateMessageFromPromptTemplate({request: promptRequest})
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