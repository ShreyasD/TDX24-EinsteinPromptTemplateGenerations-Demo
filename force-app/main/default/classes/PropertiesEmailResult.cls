public with sharing class PropertiesEmailResult {
    @AuraEnabled
    public Boolean isSuccess {get; set;}

    @AuraEnabled
    public String error {get; set;}
}