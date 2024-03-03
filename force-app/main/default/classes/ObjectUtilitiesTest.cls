@isTest
public class ObjectUtilitiesTest {
    @isTest
    static void findObjectNameFromRecordIdTest() {
        //GIVEN
        Contact cnt = new Contact();
        cnt.FirstName = 'Test';
        cnt.LastName = 'Contact';
        insert cnt;
        cnt = [SELECT Id FROM Contact WHERE Name = 'Test Contact'];

        //WHEN
        String objType = ObjectUtilities.findObjectNameFromRecordId(cnt.Id);

        //THEN
        System.assertEquals('Contact', objType);
    }
}