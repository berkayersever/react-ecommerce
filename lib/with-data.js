import React from 'react';
import Head from 'next/head';
import { getDataFromTree } from 'react-apollo';
import { I18nextProvider } from 'react-i18next';

import initApollo from './init-apollo';
import { getTranslation } from './i18n/helpers';
import startI18n from './i18n/start';

export default App => {
  const lang = 'en';

  return class Apollo extends React.Component {
    static displayName = 'withApollo(App)';

    static async getInitialProps(ctx) {
      const { Component, router } = ctx;
      let isLoggedIn = false;
      // Get translations
      const translations = await getTranslation({
        lang,
        files: ['common', 'basket', ...(App.l18namespaces || [])]
      });

      const appProps = {
        pageProps: {
          router,
          isLoggedIn
        }
      };

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apollo = initApollo();
      if (process.browser) {
        isLoggedIn = window.isLoggedIn || false;
      } else {
        isLoggedIn = ctx.ctx.req.headers.isLoggedIn || false;
        const i18n = startI18n({ files: translations, lang });

        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <I18nextProvider
              i18n={i18n}
              initialLanguage={lang}
              initialI18nStore={translations}
            >
              <App
                {...appProps}
                Component={Component}
                router={router}
                apolloClient={apollo}
                isLoggedIn={isLoggedIn}
              />
            </I18nextProvider>,
            {
              router,
              isLoggedIn
            }
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          /* eslint-disable */
          console.error('Error while running `getDataFromTree`', error);
          /* eslint-enable */
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apollo.cache.extract();

      // Run the initial props from the component
      if (App.getInitialProps) {
        // Get the component data from the cache
        if (!process.browser && Component.graph) {
          try {
            ctx.ctx.graphData = apollo.cache.readQuery({
              query: Component.graph.query,
              ...Component.graph.options(ctx)
            });
          } catch (e) {
            /* eslint-disable */
            console.log('Could not get from cache');
            /* eslint-enable */
          }
        }

        const { pageProps } = await App.getInitialProps(ctx);
        Object.assign(appProps.pageProps, pageProps);
      }

      return {
        ...appProps,
        apolloState,
        translations,
        isLoggedIn
      };
    }

    constructor(props) {
      super(props);
      this.apolloClient = initApollo(props.apolloState);
      this.i18n = startI18n({ files: props.translations, lang });
    }

    render() {
      const { translations } = this.props;

      return (
        <I18nextProvider
          i18n={this.i18n}
          initialLanguage={lang}
          initialI18nStore={translations}
        >
          <App {...this.props} apolloClient={this.apolloClient} />
        </I18nextProvider>
      );
    }
  };
};
