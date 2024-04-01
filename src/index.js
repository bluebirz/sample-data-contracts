const express = require('express');
const Ajv = require('ajv');
const addFormat = require('ajv-formats');
const yaml = require('js-yaml');
const fs = require('fs');


// load contract from yaml file
const contract = yaml.load(fs.readFileSync('./src/contracts/contract.yml'));
const contract_key = 'my_contract';

// ajv validate the contract
const AJV = new Ajv({ strict: false });
addFormat(AJV);
AJV.addSchema(contract, contract_key);

// express init app
const PORT = process.env.PORT || 4001;
const app = express();
app.use(express.json());

app.post('/people', (req, res) => {
    const validator = AJV.compile({ $ref: `${contract_key}#/components/schemas/people` });
    const validate_result = validator(req.body)
    if (validate_result) {
        return res.sendStatus(201);
    }
    else {
        return res.status(400).send(validator.errors);
    }
});

app.listen(PORT, () => {
    console.log(`Server started. Listing at port ${PORT}`);
})