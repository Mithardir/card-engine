import { flow3, flow4, getStateTree } from "./test4";

// ReactDOM.render(
//   <DialogsProvider>
//     <DetailProvider>
//       <App />
//     </DetailProvider>
//   </DialogsProvider>,
//   document.getElementById("root")
// );

console.log(getStateTree({ a: 5, b: 5 }, flow3));
console.log(getStateTree({ a: 5, b: 5 }, flow4));
