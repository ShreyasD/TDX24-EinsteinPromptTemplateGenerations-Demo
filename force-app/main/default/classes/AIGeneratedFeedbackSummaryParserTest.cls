@isTest
public class AIGeneratedFeedbackSummaryParserTest {
    @isTest
    static void parseTest() {
        //GIVEN
        List<String> jsonStrings = new List<String>{
            '{' +
            '"AIGeneratedFeedback": "Test Generated Feedback",' +
            '"AIGeneratedRecommendation": "Test Generated Recommendation",' +
            '"AIGeneratedSentiment": "neutral",' +
            '"Rating": 4.7,' +
            '"PropertyId": "0001220002212"' +
             '}'
        };

        //WHEN
        List<AIGeneratedFeedbackSummaryParser.AIGeneratedFeedbackSummary> generatedSummary = 
            AIGeneratedFeedbackSummaryParser.parse(jsonStrings);

        //THEN
        System.assertEquals(generatedSummary[0].AIGeneratedFeedback, 'Test Generated Feedback');
        System.assertEquals(generatedSummary[0].AIGeneratedRecommendation, 'Test Generated Recommendation');
        System.assertEquals(generatedSummary[0].AIGeneratedSentiment, 'neutral');
        System.assertEquals(generatedSummary[0].Rating, 4.7);
        System.assertEquals(generatedSummary[0].PropertyId, '0001220002212');
    }
}