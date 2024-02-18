public with sharing class PropertiesInterestedContactPromptExt {

    @InvocableMethod(CapabilityType='FlexTemplate://Dreamhouse_Interested_Properties_Contact') // Matches API Name of template
    public static List<Response> getPrompt(List<Request> requests) {
        //get input
        Request input = requests[0];
        
        //generate output
        Response output = new Response();
        
        //first property
        output.Prompt = 'Similar Properties for ' + input.Property1.Name ;
        output.Prompt += '\n: ' + JSON.serialize(PropertyController.getSimilarProperties(input.Property1.Id, input.Property1.Tags__c));

        //second property
        output.Prompt = 'Similar Properties for ' + input.Property2.Name ;
        output.Prompt += '\n: ' + JSON.serialize(PropertyController.getSimilarProperties(input.Property2.Id, input.Property2.Tags__c));
        
        //third property
        //first property
        output.Prompt = 'Similar Properties for ' + input.Property3.Name ;
        output.Prompt += '\n: ' + JSON.serialize(PropertyController.getSimilarProperties(input.Property3.Id, input.Property3.Tags__c));
        
        return new List<Response>{output};
    }

    // Type and Name of all variables must match as defined when creating the template
    public class Request {
        @InvocableVariable
        public Contact Contact;
        @InvocableVariable
        public Property__c Property1;
        @InvocableVariable
        public Property__c Property2;
        @InvocableVariable
        public Property__c Property3;
    }

    public class Response {
        @InvocableVariable(required=true)
        public String Prompt;
    }
}