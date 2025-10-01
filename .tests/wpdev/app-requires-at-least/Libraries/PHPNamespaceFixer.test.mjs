
import _ from "lodash";
// import libraries
import JSONPathPHP from "../../../../app-requires-at-least/Libraries/JSONPathPHP.mjs";
import PHPParser from "../../../../app-requires-at-least/Libraries/PHPParser.mjs";


describe('PHPNamespaceFixer.mjs', () => {
    test('Test fix nested namespace', () => {
        // these files contain 2 namespaces in different styles.
        const PHPFile1 = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2.php';
        const PHPFile2 = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2-bracket.php';
        const parsedCode1 = PHPParser.parseCode(PHPFile1);
        const parsedCode2 = PHPParser.parseCode(PHPFile2);
        const JSONPathPHPObj = new JSONPathPHP();
        const namespacesFile1 = JSONPathPHPObj.queryPHPNamespace(parsedCode1);
        const namespacesFile2 = JSONPathPHPObj.queryPHPNamespace(parsedCode2);

        // search the namespaces of these files and must be matched.
        const searchNSFile1 = _.at(namespacesFile1, ['[0].name', '[1].name']);
        const searchNSFile2 = _.at(namespacesFile2, ['[0].name', '[1].name']);
        expect(searchNSFile1.sort()).toEqual(searchNSFile2.sort());

        for (const eachNS of namespacesFile1) {
            if (typeof(eachNS.children) === 'object' && Array.isArray(eachNS.children)) {
                for (const eachNSChild of eachNS.children) {
                    if (eachNSChild?.kind === 'namespace' && typeof(eachNSChild.name) === 'string') {
                        // if there is nested namespace.
                        // there should have no nested namespace.
                        expect(eachNSChild.name).toBeUndefined();
                    }
                }// endfor;
            }
        }// endfor;

        for (const eachNS of namespacesFile2) {
            if (typeof(eachNS.children) === 'object' && Array.isArray(eachNS.children)) {
                for (const eachNSChild of eachNS.children) {
                    if (eachNSChild?.kind === 'namespace' && typeof(eachNSChild.name) === 'string') {
                        expect(eachNSChild.name).toBeUndefined();
                    }
                }// endfor;
            }
        }// endfor;
    });// end test();
});// end describe();