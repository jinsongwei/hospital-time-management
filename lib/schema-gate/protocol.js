/**
 *   author: William Jin
 */

/**
 *  ----- API for schema validation -----
 */


/**
 *
 * @param hospitalName: hospital name
 * @param version:  schema version
 * @param schemaJson: json object that map TassFly to hospital attributes
 * @param callback: (err, null) if succeed err is null
 */
exports.registerSchema = (hospitalName, version, schemaJson, callback) => {
};

/**
 * @param hospitalName : hospital name
 * @param version: schema version
 * @param schemaJson: json object that map TassFly to hospital attributes
 * @param callback: if succeed err is null.
 */
exports.updateSchema = (hospitalName, version, schemaJson, callback) => {
};

/**
 *
 * @param hospitalName
 * @param version
 * @param callback: (err, schema), schema is dynamoDB document type (hospital -> TaasFly) mapping
 */
exports.getSchema = (hospitalName, version, callback) =>{
};

/**
 * @param jsonFormat: json object
 * @return dynamoDB document type object
 */
exports.jsonToDocument = (jsonFormat) =>{

};

/**
 * @param documentFormat
 * return json type object
 */
exports.documentToJson = (documentFormat) =>{

};

