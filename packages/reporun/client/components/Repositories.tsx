import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { Repository } from 'reporun';
import List from 'rsuite/esm/List';
import Layout from './Layout';

export async function loader() {
    const response = await fetch('/api/repositories', {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error();
    }
    return await response.json();
}

export default function Repositories() {
    const repositories = useLoaderData() as Repository[];
    return (
        <Layout title='Repositories'>
            <List>
                {repositories.map((repository) => (
                    <List.Item key={repository.id}>
                        <Link to={repository.id}>{repository.id}</Link>
                    </List.Item>
                ))}
            </List>
        </Layout>
    );
}