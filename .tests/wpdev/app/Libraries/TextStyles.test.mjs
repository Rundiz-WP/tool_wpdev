
import TextStyles from '../../../../app/Libraries/TextStyles.mjs';


describe('TextStyles.mjs test', () => {
    test('Test required methods', () => {
        expect(TextStyles.commandHeader('My command')).toMatch(/My command/);
        expect(TextStyles.taskHeader('My task')).toMatch(/My task/);
        expect(TextStyles.txtError('My error')).toMatch(/My error/);
        expect(TextStyles.txtInfo('My info')).toMatch(/My info/);
        expect(TextStyles.txtSuccess('My success')).toMatch(/My success/);
        expect(TextStyles.txtWarning('My warning')).toMatch(/My warning/);
    });// end test()
});// end describe()
