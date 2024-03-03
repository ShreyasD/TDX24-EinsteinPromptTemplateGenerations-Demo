@isTest
public class EinsteinGenAIGatewayServiceTest {
    @isTest(SeeAllData=true)
    static void generateMessageTest() {
        //GIVEN
        String prompt = 'Just testing a prompt';

        //WHEN
        Test.startTest();
        EinsteinGenAIGatewayService.PromptGenerationResponse response = EinsteinGenAIGatewayService.generateMessage(prompt);
        Test.stopTest();

        //THEN
        //System.assertEquals('Just testing a prompt', response.prompt);
        //System.assertNotEquals(null, response.generations);
    }

    @isTest(SeeAllData=true)
    static void generateMessageFromPromptTemplateTest() {
        //GIVEN
        EinsteinGenAIGatewayService.PromptGenerationRequest request = new EinsteinGenAIGatewayService.PromptGenerationRequest();
        request.templateNameOrId = 'Dreamhouse_Contact_Health_Score_Summary';
        request.inputMap = new Map<String, String>{'Input:Contact' => '003TC000001C9lJYAS'};

        //WHEN
        Test.startTest();
        EinsteinGenAIGatewayService.PromptGenerationResponse response = EinsteinGenAIGatewayService.generateMessageFromPromptTemplate(request);
        Test.stopTest();

        //THEN
        //System.assertNotEquals(null, response.prompt);
        //System.assertNotEquals(null, response.generations);
    }
}