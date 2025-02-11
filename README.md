# Rslib Project
This project uses RsLib to build the package. For more information see the [docs](https://rsbuild.dev/).

## Module Federation

Module federation plugin package is `@module-federation/rsbuild-plugin`. This supplies the `pluginModuleFederation` configuration for the `rslib.config.ts` file. Fore more details on module federation see [docs](https://module-federation.io/).

The configuration using `@module-federation/rslib-core` `defineConfig`  is as follows and is configured to run as a remote.

```typescript
...
export default defineConfig({
  lib: [
    {
      format: 'mf',
      syntax: 'es2020',
      output: {
        distPath: {
          root: './dist/mf',
        },
        filename: {},
        cleanDistPath: true,
      },
      dev: {
        hmr: true,
      },
      plugins: [
        // ...
        pluginModuleFederation({
          name: 'react_provider',
          exposes: {
            './App': './src/App.tsx',
          },
          filename: 'remoteEntry.mjs',
          async: false,
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],

  ...
  plugins: [pluginReact()],
});

```  

To make it possible that we can serve a different version of react than the host. The `React` libs are shared.  See the `App.tsx`. This is the entry point for the module.

## Usage in Angular

Because `React` is a singleton and this is just a component. The host will have to share a compatible version of `React` with the mfe, in this example that is `react@^18.0.0`  

See the following of an example that uses an angular component and wraps the react component within in it.

```typescript
import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

const containerElementName = 'customReactProviderComponentContainer';

@Component({
  selector: 'app-react-provider',
  template: ` <h3 style="color: cadetblue">RsLib (React Microfrontend)</h2>
    <span #${containerElementName}></span>`,
  encapsulation: ViewEncapsulation.None,
})
export class ReactProviderComponent {
  @ViewChild(containerElementName, { static: true }) containerRef!: ElementRef;
  root!: any;

  constructor() {}

  ngAfterViewInit() {
    this.root = createRoot(this.containerRef.nativeElement);
    this.root.render('Loading script...');
    try {
      import('react_provider/App').then(val => {
        this.root.render(React.createElement(val.App));
      });
    } catch (error) {
      console.log('Error', error);
    }
  }

  ngOnDestroy() {
    this.root.unmountComponentAtNode(this.containerRef.nativeElement);
  }
}
```

After the view is initialised. The angular lifecycle method `ngAfterViewInit` creates a `react-dom/client` root. WHich is used to render the component. This is imported using an import statement and uses the result of the import to get the component.

In order to register the module with angular type declarations are created.

- At the application level `declare module 'react_provider/*'`
- At the project level `declare module 'react_provider'`

Angular uses webpack for configuration. Webpack has first class support for module federation. This is where the remote is registered in the plugins.

```typescript
module.exports = {
  ...
  plugins: [
    new container.ModuleFederationPlugin({
      name: 'example',
      filename: 'remoteEntry.js',
      remotes: {
        ...
        react_provider: `react_provider@http://localhost:3000/remoteEntry.mjs`,
        ...
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom/client': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
      },
    }),
  ],
};

```

The app module will need to initialise the remotes and there modules. Use `@module-federation/utilities` you can create an initialisation function to bootstrap
this as part of the application initialisation.

```typescript

export function initializeApp(): () => void {
  return () => {
    ...
    importRemote({
      url: 'http://localhost:3000/mf/remoteEntry.mjs',
      scope: 'react_provider',
      module: './App',
    });
    ...

  };
}

...

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
    },
  ],

```

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get Started

Start the dev server:

```bash
pnpm dev
```

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```
