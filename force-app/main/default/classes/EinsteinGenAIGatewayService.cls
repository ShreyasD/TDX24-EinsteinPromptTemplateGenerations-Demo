public class EinsteinGenAIGatewayService {
    @AuraEnabled
    public static PromptGenerationResponse generateMessage(String prompt) {
        // Create the input
        ConnectApi.EinsteinLlmGenerationsInput generationsInput = new ConnectApi.EinsteinLlmGenerationsInput();
        generationsInput.promptTextorId = prompt;
        generationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        generationsInput.additionalConfig.temperature = 0;
        generationsInput.additionalConfig.applicationName = 'PromptBuilderPreview';

        // Call the service
        ConnectApi.EinsteinLLMGenerationsOutput generationsOutput = ConnectApi.EinsteinLLM.generateMessages(generationsInput);

        // Consume response
        PromptGenerationResponse response = new PromptGenerationResponse();
        response.prompt = generationsOutput.prompt;
        response.generations = generationsOutput.generations;

        return response;
    }

    @AuraEnabled
    public static PromptGenerationResponse generateMessageFromPromptTemplate(PromptGenerationRequest request) {

        //Initialize Prompt Generations Input
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptGenerationsInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptGenerationsInput.isPreview = false;
        // Set additional configuration values
        promptGenerationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptGenerationsInput.additionalConfig.temperature = 0;
        promptGenerationsInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        // Build input map
        Map<String,ConnectApi.WrappedValue> valueMap = new Map<String,ConnectApi.WrappedValue>();
        for(String key : request.inputMap.keySet()) {
            Map<String, String> recordIdMap = new Map<String, String>{'id' => request.inputMap.get(key)};
            ConnectApi.WrappedValue recordWrappedValue = new ConnectApi.WrappedValue();
            recordWrappedValue.value = recordIdMap;
            valueMap.put(key, recordWrappedValue);
        }
        promptGenerationsInput.inputParams = valueMap;

        // Call the service
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation promptOutput = 
        ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(request.templateNameOrId, promptGenerationsInput);

        // Consume response
        PromptGenerationResponse response = new PromptGenerationResponse();
        response.prompt = promptOutput.prompt;
        response.generations = promptOutput.generations;

        System.debug('response: ' + response);
        return response;
    }

    public class PromptGenerationRequest {
        @AuraEnabled
        public String templateNameOrId {get; set;}
        @AuraEnabled
        public Map<String, String> inputMap {get; set;}
    }

    public class PromptGenerationResponse {
        @AuraEnabled
        public String prompt {get; set;}
        @AuraEnabled
        public List<ConnectApi.EinsteinLLMGenerationItemOutput> generations {get; set;}
    }
}