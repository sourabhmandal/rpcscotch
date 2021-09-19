
#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd "${BASEDIR}"

PROTOC_GEN_TS_PATH="${BASEDIR}/node_modules/.bin/protoc-gen-ts"
GRPC_TOOLS_NODE_PROTOC_PLUGIN="${BASEDIR}/node_modules/.bin/grpc_tools_node_protoc_plugin"
GRPC_TOOLS_NODE_PROTOC="grpc_tools_node_protoc"
  # loop over all the available proto files and compile them into respective dir
  # JavaScript code generating
  npx ${GRPC_TOOLS_NODE_PROTOC} \
      --js_out=import_style=commonjs,binary:"${BASEDIR}/proto/" \
      --grpc_out="${BASEDIR}/proto/" \
      --plugin=protoc-gen-grpc="${GRPC_TOOLS_NODE_PROTOC_PLUGIN}" \
      -I "${BASEDIR}/proto/" \
      ${BASEDIR}/proto/*.proto

  npx ${GRPC_TOOLS_NODE_PROTOC} \
      --plugin=protoc-gen-ts="${PROTOC_GEN_TS_PATH}" \
      --ts_out="${BASEDIR}/proto/" \
      -I "${BASEDIR}/proto/" \
      ${BASEDIR}/proto/*.proto