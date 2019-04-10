const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const supportsColor = require('supports-color');
const chalk = require('chalk');
const inquirer = require('inquirer');
const emoji = require('node-emoji');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

async function envFileExists() {
  try {
    await stat(join(__dirname, '..', './.env'));
    return true;
  } catch (error) {}
  return false;
}

(async function init() {
  try {
    if (process.env.CRYSTALLIZE_TENANT_ID) {
      return;
    }

    const exists = await envFileExists();
    if (exists) {
      return;
    }

    if (supportsColor.stdout) {
      console.log(await readFile(join(__dirname, './logo.txt'), 'utf8'));
    }

    const themeColor = chalk.rgb(244, 127, 152);

    console.log(
      themeColor.bold(
        emoji.emojify(':sparkles:  Welcome awesome developer! :sparkles:\n')
      )
    );

    const { shopToUse } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shopToUse',
        message: 'Which shop do you want to use?',
        choices: [
          {
            value: 'demo',
            name: 'The demo shop - prefilled with lots of data'
          },
          'My very own tenant please'
        ]
      }
    ]);

    const envFileVars = [
      'PORT=3000',
      'GTM_ID=',
      'CRYSTALLIZE_GRAPH_URL_BASE=https://graph.crystallize.com'
    ];

    if (shopToUse !== 'demo') {
      const { tenantId, tenantToken } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tenantId',
          message: 'Your tenant ID',
          default: 'demo'
        }
      ]);
      envFileVars.push(`CRYSTALLIZE_TENANT_ID=${tenantId}`);
    } else {
      envFileVars.push('CRYSTALLIZE_TENANT_ID=demo');
    }

    // Set the env file
    await writeFile(join(__dirname, '..', './.env'), envFileVars.join('\n'));

    // Remove greeting from package.json
    const packageJson = await readFile(
      join(__dirname, '../', './package.json'),
      'utf8'
    );
    const packageJsonObj = JSON.parse(packageJson);
    delete packageJsonObj.scripts.postinstall;
    await writeFile(
      join(__dirname, '../', './package.json'),
      JSON.stringify(packageJsonObj, null, 3),
      'utf-8'
    );

    console.log(
      emoji.emojify('\n\nWell done! :muscle:  Your shop is set to go! :star:')
    );

    console.log(`
      To start in development mode: ${themeColor('npm run dev')} 
      To start in ${chalk.italic('super fast')} production mode: ${themeColor(
      'npm run prod'
    )}
    `);

    console.log(
      chalk.hex('#dadada')(
        `\nYour settings are saved in the root .env file\n\n`
      )
    );
  } catch (error) {
    console.log('Oh no. An error occured in the Crystallize greeting script.');
    console.log(error);
  }
})();
