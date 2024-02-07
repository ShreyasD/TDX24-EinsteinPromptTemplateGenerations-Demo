// Create input
ConnectApi.EinsteinPromptTemplateGenerationsInput promptGenerationsInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
promptGenerationsInput.isPreview = false;

// Build input map
Map<String,ConnectApi.WrappedValue> valueMap = new Map<String,ConnectApi.WrappedValue>();

Map<String, String> customerRecordIdMap = new Map<String, String>();
customerRecordIdMap.put('id', '003TC000001An3hYAC');

// Add wrapped values to map
ConnectApi.WrappedValue customerWrappedValue = new ConnectApi.WrappedValue();
customerWrappedValue.value = customerRecordIdMap;

valueMap.put('Input:Customer', customerWrappedValue);

promptGenerationsInput.inputParams = valueMap;

// Set additional configuration values
promptGenerationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
promptGenerationsInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

// Call the service
ConnectApi.EinsteinPromptTemplateGenerationsRepresentation promptOutput = 
ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('0hfTC0000001OWXYA2', promptGenerationsInput);

// Consume response
System.debug('Prompt Testing: ' + promptOutput.prompt);
System.debug('Response: ' + promptOutput.generations);

// Create the input
// ConnectApi.EinsteinLlmGenerationsInput generationsInput = new ConnectApi.EinsteinLlmGenerationsInput();
// generationsInput.promptTextorId = promptOutput.prompt;
// generationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
// generationsInput.additionalConfig.maxTokens = 512;
// generationsInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

// // Call the service
// ConnectApi.EinsteinLLMGenerationsOutput generationsOutput = ConnectApi.EinsteinLLM.generateMessages(generationsInput);

// // Consume response
// ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
// System.debug('Response: ' + response.text);