var ToolComponent = require('./tool');

var ToolboxComponent = Vue.extend({
  template: require('./toolbox.html'),
  props: ['state', 'resourcesurl'],
  data: function() {
    return {}
  },
  components: {
    'tool': ToolComponent
  },
  methods: {
    select: function() {
      if (!this.isLayerReady())
        return;
      if (!this.state.selected) {
        this.$emit('setselectedtoolbox', this.state.id);
      }
    },
    toggleEditing: function() {
      //se il toolbox non è ancora abilitato non faccio niente
      if (!this.state.layerstate.editing.ready)
        return;
      this.$emit('stoptoolbox', this.state.id);
      // verifico se il toobox in oggetto è in editing o no
      this.state.editing.on ? this.$emit('stoptoolbox', this.state.id): this.$emit('starttoolbox', this.state.id);
    },
    saveEdits: function() {
      this.$emit('savetoolbox', this.state.id);
    },
    // funzione che visualizza il toolbox appena sono disponibili le configurazioni
    // fields (passato dal metodo perchè in grado di ricevere parametri)
    isLayerReady: function() {
      return this.state.layerstate.editing.ready;
    },
    stopActiveTool:function() {
      this.$emit('stopactivetool', this.state.id);
    },
    setActiveTool: function(toolId) {
      this.$emit('setactivetool', toolId, this.state.id);
    }
  }
});


module.exports = ToolboxComponent;

