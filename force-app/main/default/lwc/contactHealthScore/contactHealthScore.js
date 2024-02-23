import { LightningElement, api } from 'lwc';

import generateMessageFromPromptTemplate from '@salesforce/apex/EinsteinGenAIGatewayService.generateMessageFromPromptTemplate';

export default class ContactHealthScore extends LightningElement {
    @api recordId;
    @api safetyThreshold = 0.15;

    healthScore;
    reason;

    connectedCallback() {
        console.log('ContactHealthScore->connectedCallback');
        this.generateContactHealthScore();
    }

    generateContactHealthScore() {
        let inputMap = {
            "Input:Contact": this.recordId
        }
        let promptRequest = {
            inputMap: inputMap,
            templateNameOrId: "Dreamhouse_Contact_Health_Score_Summary"
        }

        generateMessageFromPromptTemplate({request: promptRequest})
            .then((result) => {
                //parse prompt response and update UI
                if(result.generations[0].safetyScoreRepresentation.safetyScore > this.safetyThreshold){
                    let response = JSON.parse(this.htmlDecode(result.generations[0].text.replace(/[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")));
                    this.healthScore = response.healthScore;
                    this.reason = response.reason;

                    //Change class based on score
                    let healthScoreSpan = this.refs.healthScoreSpan;
                    if(this.healthScore < 4) healthScoreSpan.classList.add(".low-score");
                    else if (this.healthScore >= 4 && this.healthScore <= 7) healthScoreSpan.classList.add(".medium-score");
                    else healthScoreSpan.classList.add(".high-score");
                } else {
                    this.error = {
                        message: "Generated message doesn't meet safety threshold. Please try again ..."
                    }
                }

                this.isLoading = false;
            })
            .catch((error) => {
                console.log("error: " + JSON.stringify(error));
                this.error = error;
                this.isLoading = false;
            });
    }

    htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
}