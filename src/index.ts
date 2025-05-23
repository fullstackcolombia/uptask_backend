import server from "./server";
import colors from "colors";

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(
    colors.bgCyan.bold(`REST API - Server is running on port ${port}`)
  );
});
