import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// Getting the top level nodes
export const query = gql`
  query {
    tree(language: "en", path: "/") {
      ...itemProp
    }
  }
  fragment itemProp on Item {
    id
    name
    type
    path
  }
`;

export default graphql(query, {
  props: ({ data }) => {
    if (!data || data.loading) {
      return data;
    }
    return {
      topLevelFolders: (data.tree || []).filter(i => i.type === 'folder'),
      tenant: data.tenant
    };
  }
});
