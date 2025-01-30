import React from 'react';
import Login from '../components/login/Login';
import Accountant from '../pages/accountant/accountentMain/AccountentMain';
import Manager from '../pages/manager/mengement/Mengement';
import Director from '../pages/director/Main/Main';
import Persons from '../pages/manager/persons/Persons';


export const routes = [
    { path: '/login', element: <Login /> },

    // Manager
    { path: '/manager', element: <Manager />, private: true, role: 'manager' },
    { path: '/persons', element: <Persons />, private: true, role: 'manager' },

    // Accountant
    { path: '/accountant', element: <Accountant />, private: true, role: 'accountant' },

    // Director
    { path: '/director', element: <Director />, private: true, role: 'director' },
];
