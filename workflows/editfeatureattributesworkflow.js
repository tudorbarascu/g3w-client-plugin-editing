var inherit = g3wsdk.core.utils.inherit;
var base =  g3wsdk.core.utils.base;
var EditingWorkflow = require('./editingworkflow');
var PickFeatureStep = require('./steps/pickfeaturestep');
var OpenFormStep = require('./steps/openformstep');

function EditFeatureAttributesWorkflow(options) {
  options = options || {};
  // workflow composto da due steps:
  // Il primo servre per fare selezionare la feature
  // il secondo per aprire il form
  options.steps = [new PickFeatureStep(), new OpenFormStep()];
  base(this, options);
}

inherit(EditFeatureAttributesWorkflow, EditingWorkflow);

var proto = EditFeatureAttributesWorkflow.prototype;

module.exports = EditFeatureAttributesWorkflow;