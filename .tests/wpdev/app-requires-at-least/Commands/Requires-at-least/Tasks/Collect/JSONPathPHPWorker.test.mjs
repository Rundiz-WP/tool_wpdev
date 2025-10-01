
import { JSONPath } from 'jsonpath-plus';
// import command's worker
import JSONPathPHPWorker from "../../../../../../../app-requires-at-least/Commands/Requires-at-least/Tasks/Collect/JSONPathPHPWorker.mjs";
// import libraries
import JSONPathPHP from "../../../../../../../app-requires-at-least/Libraries/JSONPathPHP.mjs";
import PHPParser from '../../../../../../../app-requires-at-least/Libraries/PHPParser.mjs';
// import test dependencies


describe('JSONPathPHPWorker.mjs doc block', () => {
    test('Total doc blocks', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/code-comments.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const codeComments = JSONPath({path: '$.comments[?(@.kind=="commentblock")]', json: parsedCode, ignoreEvalErrors: true});

        expect(codeComments.length).toBe(4);
    });// end test();


    test('Test first docblock', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/code-comments.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const codeComments = JSONPathPHPObj.queryPHPCodeCommentBlock(parsedCode, 14);// query code comment at this line or before.

        const expectedResults = {
            'versions': ['0.0.2', '0.0.3', '0.0.5', '0.0.6'],
            'descriptions': [
                '',
                'One line description.',
                'End multiple lines desc of since 0.0.5',
                'End file level.',
            ],
        };

        expect(typeof(codeComments[0].value)).toBe('string');
        const [versions, descriptions] = JSONPathPHPWorkerObj.getCodeVersionDescription(codeComments[0].value);
        expect(expectedResults.versions.sort()).toEqual(versions.sort());
        descriptions.forEach((eachDescription, index) => {
            if (eachDescription === '') {
                return;// break
            }
            expect(eachDescription).toMatch(new RegExp(RegExp.escape(expectedResults.descriptions[index]) + '$'));
        })// endforEach;
    });// end test();


    test('Test 3rd docblock', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/code-comments.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const codeComments = JSONPathPHPObj.queryPHPCodeCommentBlock(parsedCode, 38);// query code comment at this line or before.
        codeComments.reverse();
        if (codeComments > 1) {
            codeComments.splice(0, (codeComments.length - 1));
        }

        const expectedResults = {
            'versions': ['0.2.0', '0.2.1', '0.2.2', '0.2.3'],
            'descriptions': [
                '',
                'One line description.',
                'End multiple lines desc of since 0.2.2',
                'End doc block 3.',
            ],
        };

        expect(typeof(codeComments[0].value)).toBe('string');
        const [versions, descriptions] = JSONPathPHPWorkerObj.getCodeVersionDescription(codeComments[0].value);
        expect(expectedResults.versions.sort()).toEqual(versions.sort());
        descriptions.forEach((eachDescription, index) => {
            if (eachDescription === '') {
                return;// break
            }
            expect(eachDescription).toMatch(new RegExp(RegExp.escape(expectedResults.descriptions[index]) + '$'));
        })// endforEach;
    });// end test();


    test('Test 4th docblock', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/code-comments.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const codeComments = JSONPathPHPObj.queryPHPCodeCommentBlock(parsedCode, 50);// query code comment at this line or before.
        codeComments.reverse();
        if (codeComments > 1) {
            codeComments.splice(0, (codeComments.length - 1));
        }

        const expectedResults = {
            'versions': ['0.3.0', '0.3.1', '0.3.2', '0.3.3'],
            'descriptions': [
                '',
                'One line description.',
                'End multiple lines desc of since 0.3.2',
                'End doc block 4.',
            ],
        };

        expect(typeof(codeComments[0].value)).toBe('string');
        const [versions, descriptions] = JSONPathPHPWorkerObj.getCodeVersionDescription(codeComments[0].value);
        expect(expectedResults.versions.sort()).toEqual(versions.sort());
        descriptions.forEach((eachDescription, index) => {
            if (eachDescription === '') {
                return;// break
            }
            expect(eachDescription).toMatch(new RegExp(RegExp.escape(expectedResults.descriptions[index]) + '$'));
        })// endforEach;
    });// end test();
});// end describe();