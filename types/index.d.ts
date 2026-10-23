declare module 'claude-code' {
  interface PluginState {
    'next-steps-plus': {
      // The settings pane's selected row: a userConfig field name.
      selected: string
      // Why the last typed number was refused; empty when none was.
      refusal: string
      // The setting whose box holds the cursor; empty while on the list.
      editing: string
    }
  }
}
