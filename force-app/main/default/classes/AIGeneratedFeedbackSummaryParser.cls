/*
 * @author: sdhond
 * @authorEmail:sdhond@salesforce.com
 * @Description: 
 		Parse JSON Data for AIGeneratedFeedback prompt action in Flowbuilder
*/
public with sharing class AIGeneratedFeedbackSummaryParser {
    @InvocableMethod(label='AIGeneratedFeedbackSummary JSON Parser' 
    description='Returns AIGeneratedFeedbackSummary object')
    public static List<AIGeneratedFeedbackSummary> parse(List<String> jsonStrings) {
        System.debug('jsonString: ' + jsonStrings[0]);
        AIGeneratedFeedbackSummary parsedSummary = (AIGeneratedFeedbackSummary) JSON.deserializeStrict(jsonStrings[0], AIGeneratedFeedbackSummary.class);
        return new List<AIGeneratedFeedbackSummary>{parsedSummary};
    }
    
    public class AIGeneratedFeedbackSummary {
        @InvocableVariable(label='AIGeneratedFeedback')
        public String AIGeneratedFeedback;
        @InvocableVariable(label='AIGeneratedRecommendation')
        public String AIGeneratedRecommendation;
        @InvocableVariable(label='AIGeneratedSentiment')
        public String AIGeneratedSentiment;
        @InvocableVariable(label='Rating')
        public Double Rating;
        @InvocableVariable(label='PropertyId')
        public String PropertyId;
    }
}