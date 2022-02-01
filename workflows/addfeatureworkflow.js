const {base, inherit} = g3wsdk.core.utils;
const {isPolygonGeometryType} = g3wsdk.core.geometry.Geometry;
const EditingWorkflow = require('./editingworkflow');
const AddFeatureStep = require('./steps/addfeaturestep');
const OpenFormStep = require('./steps/openformstep');

function AddFeatureWorkflow(options={}) {
  const addfeaturestep = new AddFeatureStep(options);
  const openformstep = new OpenFormStep(options);
  const drawTool = {
    type: 'draw',
    options: {
      shape_types: ['Draw', 'Square', 'Box', 'Triangle',  'Circle', 'Ellipse'],
      current_shape_type: 'Draw',
      edit_feature_geometry: null,
      radius: 0,
      onChange(type){
        this.radius = type === 'Circle' ? 0 : null;
        this.edit_feature_geometry = type === 'Circle' ? 'radius' : type === 'Ellipse' ? null: 'vertex';
        this.edit_feature_geometry = this.edit_feature_geometry;
        addfeaturestep.getTask().changeDrawShapeStyle(type);
      },
      onBeforeDestroy(){
        this.current_shape_type = 'Draw';
        this.edit_feature_geometry = null;
        this.radius = 0;
      }
    }
  };
  addfeaturestep.on('run', ({inputs, context}) => {
    const toolsoftools = [];
    delete inputs.draw_options;
    const layer = inputs.layer;
    const snapTool = {
      type: 'snap',
      options: {
        layerId: layer.getId(),
        source: layer.getEditingLayer().getSource(),
        active: true
      }
    };
    toolsoftools.push(snapTool);
    if (isPolygonGeometryType(layer.getGeometryType())) toolsoftools.push(drawTool);
    this.emit('settoolsoftool', toolsoftools);
    inputs.draw_options = drawTool.options;
  });
  addfeaturestep.on('stop', () => {
    this.emit('unsettoolsoftool');
  });

  options.steps = [addfeaturestep, openformstep];
  base(this, options);
}

inherit(AddFeatureWorkflow, EditingWorkflow);

module.exports = AddFeatureWorkflow;
