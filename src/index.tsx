import { flow3, getStateTree } from "./test4";

// ReactDOM.render(
//   <DialogsProvider>
//     <DetailProvider>
//       <App />
//     </DetailProvider>
//   </DialogsProvider>,
//   document.getElementById("root")
// );

console.log(getStateTree({ a: 1, b: 2 }, flow3));
