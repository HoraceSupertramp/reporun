import React from 'react';
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import { createRoot } from 'react-dom/client';
import Repositories, { loader as repositoriesLoader } from './components/Repositories';
import Repository, { loader as repositoryLoader } from './components/Repository';
import 'rsuite/dist/rsuite.min.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Navigate to="/repositories"/>
        )
    },
    {
        path: 'repositories',
        children: [
            {
                element: <Repository/>,
                path: ":repository",
                loader: repositoryLoader,
            },
            {
                index: true,
                element: <Repositories/>,
                loader: repositoriesLoader,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
