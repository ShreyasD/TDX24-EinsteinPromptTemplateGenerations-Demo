EinsteinGenAIGatewayService.PromptGenerationRequest request = new EinsteinGenAIGatewayService.PromptGenerationRequest();
request.templateNameOrId = 'Case_Interaction_Summary';
request.inputMap = new Map<String, String>{'Input:Case' => '500TC000001fdpKYAQ'};
EinsteinGenAIGatewayService.generateMessageFromPromptTemplate(request); 