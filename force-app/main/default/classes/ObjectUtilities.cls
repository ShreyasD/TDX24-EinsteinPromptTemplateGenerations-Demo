public with sharing class ObjectUtilities {
    @AuraEnabled(cacheable=true scope='global')
    public static String findObjectNameFromRecordId(Id recordId){
        String objectName = '';
        try{
            objectName = recordId.getSObjectType().getDescribe().getName();
        }catch(Exception e){
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
        return objectName;
    }
}