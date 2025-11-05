import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Description from './components/Description';
import { Element } from 'react-scroll';
import Code from './components/Code';
import Application from './components/Application';
import KdTreeViewer from './components/KdTreeViewer';

export default function App() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-4 p-4 sm:p-8 font-sans">
                <Element name="intro">
                    <Description />
                </Element>
                <Element name="vis">
                    <KdTreeViewer />
                </Element>
                <Element name="code">
                    <Code />
                </Element>
                <Element name="app">
                    <Application />
                </Element>
            </div>
        </>
    );
}