import React from "react";
import { View, Text, StyleSheet } from "react-primitives";
import { createContainer, query } from "@phenomic/preset-react-app/lib/client";

import Link from "../Link";
import ActivityIndicator from "../ActivityIndicator";

const ChangelogListPage = (props: Object) => (
  <View>
    {props.isLoading && <ActivityIndicator />}
    {!props.isLoading &&
      <View style={styles.page}>
        <Text style={styles.title}>
          {"Changelog"}
        </Text>
        {props.apis.node.list.map(api => (
          <View key={api.id}>
            <Link to={`/changelog/${api.id}`}>
              <Text style={styles.property}>
                {api.title}
              </Text>
            </Link>
          </View>
        ))}
      </View>}
  </View>
);

const styles = StyleSheet.create({
  page: {
    padding: 10,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center"
  },
  title: {
    fontSize: 40,
    fontWeight: "900"
  },
  property: {
    backgroundColor: "#fafafa",
    borderRadius: 2,
    fontFamily: "monospace",
    fontSize: 20
  }
});

export default createContainer(ChangelogListPage, () => ({
  apis: query({
    collection: "changelog"
  })
}));
