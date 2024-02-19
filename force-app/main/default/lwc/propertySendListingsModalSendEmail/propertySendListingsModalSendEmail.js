import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import generateMessageFromPromptTemplate from '@salesforce/apex/EinsteinGenAIGatewayService.generateMessageFromPromptTemplate';
import findObjectNameFromRecordId from '@salesforce/apex/ObjectUtilities.findObjectNameFromRecordId'
import sendEmailToClient from '@salesforce/apex/PropertyController.sendEmailToClient';

export default class PropertySendListingsModalSendEmail extends LightningElement {
    @api properties;
    @api clientId;
    @api safetyThreshold = 0.15;

    emailSubject = "";
    emailContent = "";
    emailSent = false;

    error;
    isLoading = false;
    loadingText = "";

    connectedCallback() {
        //load spinner
        this.isLoading = true;
        this.loadingText = "<p class=\"slds-text-heading_small slds-text-align_center\">🏠🔄 Please wait while we fetch the latest updates for your property listings! 🔄🏠</p>" +
    "<br /><p class=\"slds-text-heading_small slds-text-align_center\">Our Generative Gateway is hard at work gathering all the essential details it needs.</p>" +
    "<br /><p class=\"slds-text-heading_small slds-text-align_center\">Sit tight, and we'll have your email content ready for you in no time!</p>";

        //get object from id
        findObjectNameFromRecordId({recordId: this.clientId})
            .then((result) => {
                let inputMap = {
                    "Input:Property1": this.properties[0].Id,
                    "Input:Property2": this.properties[1].Id,
                    "Input:Property3": this.properties[2].Id
                }
                let promptRequest = {
                    inputMap: inputMap,
                    templateNameOrId: ""
                }

                if(result === 'Contact') {
                    promptRequest.templateNameOrId = "Dreamhouse_Interested_Properties_Contact";
                    promptRequest.inputMap["Input:Contact"] = this.clientId;
                } else if (result === 'Lead') {
                    promptRequest.templateNameOrId = "Dreamhouse_Interested_Properties_Lead";
                    promptRequest.inputMap["Input:Lead"] = this.clientId;
                }
                
                //generate Gen AI email
                this.generateGenAIEmailContent(promptRequest);
            })
            .catch((error) => {
                console.log("error: " + JSON.stringify(error));
                this.error = error;
                this.isLoading = false;
            });
    }

    handleEmailSend() {
        this.isLoading = true;
        this.loadingText = "Email being sent";
        
        sendEmailToClient({
            clientId: this.clientId,
            subject: this.emailSubject,
            content: this.emailContent
        }).then((result) => {
            console.log("handleEmailSend->result: " + JSON.stringify(result));
            this.isEmailSent = true;
            this.isLoading = false;
        }).catch((error) => {
            console.log("handleEmailSend->error: " + JSON.stringify(error));
            this.error = error;
            this.isLoading = false;
        })
    }

    generateGenAIEmailContent(promptRequest) {
        generateMessageFromPromptTemplate({request: promptRequest})
            .then((result) => {

                //parse prompt response and update UI
                if(result.generations[0].safetyScoreRepresentation.safetyScore > this.safetyThreshold){
                    let emailJSON = this.htmlDecode(result.generations[0].text.replace(/[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""));
                    console.log('emailJSON: ' + emailJSON);
                    let email = JSON.parse(emailJSON);
                    console.log('emailSubject: ' + email.subject);
                    console.log('emailContent: ' + email.content);
                    this.emailSubject = email.subject;
                    this.emailContent = email.content;
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

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}