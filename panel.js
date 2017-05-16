var base = g3wsdk.core.utils.base;
var inherit = g3wsdk.core.utils.inherit;
var EditingComponent = g3wsdk.gui.vue.EditingComponent;

function EditingPluginComponent(options) {
  var options = options || {};
  var layerConfig = options.layersConfig;
  // editortoolsbars
  options.id = "editing-panel";
  options.name = "Gestione dati EDITING";
  options.editorsToolBars = layerConfig.editorsToolBars;
  options.serviceOptions = {
    layerCodes: layerConfig.layerCodes,
    layers: layerConfig.layers,
    editorClass: layerConfig.editorClass,
    editingConstraints: {
      resolution: 20 // vincolo di risoluzione massima
    },
    // attributo che permette di stabilire qual campo del layer deve essere preso per
    // essere passato all'api url editing per fare config, vector data e unlock
    editingApiField: 'id'
  };
  base(this, options)
}

inherit(EditingPluginComponent, EditingComponent);

module.exports = EditingPluginComponent;
