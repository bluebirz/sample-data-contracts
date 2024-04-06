const express = require('express');
const Ajv = require('ajv');
const addFormat = require('ajv-formats');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// init AJV
const AJV = new Ajv({ strict: false });
addFormat(AJV);

// load contracts from yaml files
const contract_folder = './src/contracts';
fs.readdirSync(contract_folder, options = { withFileTypes: 'yml' }).forEach(contract_file => {
    const contract = yaml.load(fs.readFileSync(path.join(contract_folder, contract_file.name)));
    const contract_key = contract_file.name.replace(".yml", "");

    // ajv validate the contract
    AJV.addSchema(contract, contract_key);
});

// express init app
const PORT = process.env.PORT || 4001;
const app = express();
app.use(express.json());

const validate = (contract_key, body, res) => {
    const validator = AJV.compile({ $ref: `${contract_key}#/components/schemas/${contract_key}` });
    const validate_result = validator(body)
    if (validate_result) {
        return res.sendStatus(201);
    }
    else {
        return res.status(400).send(validator.errors);
    }
};

app.post('/people', (req, res) => {
    return validate('people', req.body, res);
});
app.post('/pets', (req, res) => {
    return validate('pets', req.body, res);
});

app.listen(PORT, () => {
    console.log(`Server started. Listing at port ${PORT}`);
})