import React, { PropsWithChildren, ReactElement } from 'react';
import Container from 'rsuite/Container';
import Header from 'rsuite/Header';
import Content from 'rsuite/Content';
import styles from './index.module.scss';
import Stack from 'rsuite/Stack';

interface LayoutProps {
    title: string;
    aside?: ReactElement;
}

export default function Layout({ title, children, aside }: PropsWithChildren<LayoutProps>) {
    return (
        <Container className={styles.container}>
            <Header className={styles.title}>
                {aside != null
                    ? (
                        <Stack justifyContent='space-between'>
                            <h1>{title}</h1>
                            <div>
                                {aside}
                            </div>
                        </Stack>
                    ) : (
                        <h1>{title}</h1>
                    )}
            </Header>
            <Content>
                {children}
            </Content>
        </Container>
    );
}