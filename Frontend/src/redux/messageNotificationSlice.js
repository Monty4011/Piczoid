// import { createSlice } from "@reduxjs/toolkit";

// const messageNotificationSlice = createSlice({
//     name: "messageNotification",
//     initialState: {
//         messageNotification: []
//     },
//     reducers: {
//         setMessageNotification: (state, action) => {
//             state.messageNotification.push(action.payload)
//         }

//     }
// })

// export const { setMessageNotification } = messageNotificationSlice.actions

// export default messageNotificationSlice.reducer

import { createSlice } from "@reduxjs/toolkit";

const messageNotificationSlice = createSlice({
    name: "messageNotification",
    initialState: {
        messageNotification: [],
    },
    reducers: {
        setMessageNotification: (state, action) => {
            // const notificationExists = state.messageNotification.some(
            //     (notification) => notification.userId === action.payload.userId 
            // );

            // // Prevent adding duplicate notifications
            // if (!notificationExists) {
            //     state.messageNotification.push(action.payload);
            // }

            state.messageNotification.push(action.payload)
        },
    },
});

export const { setMessageNotification } = messageNotificationSlice.actions;

export default messageNotificationSlice.reducer;
