import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
        openSearch:false
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload
        },
        setOpenSearch: (state, action) => {
            state.openSearch = action.payload
        },
    }
})

export const { setAuthUser, setSuggestedUsers, setUserProfile, setSelectedUser,setOpenSearch } = authSlice.actions

export default authSlice.reducer