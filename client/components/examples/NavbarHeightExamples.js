/**
 * NAVBAR HEIGHT USAGE EXAMPLES
 * 
 * The navbar height is now globally available through the ChatContext.
 * Here are different ways to use it in your components:
 */

import React from 'react';
import { useChat, useNavbarHeight, useNavbarOffset } from '@/contexts/ChatContext';

// Example 1: Basic navbar height access
export function ExampleComponent1() {
    const { navbarHeight } = useChat();
    
    return (
        <div style={{ paddingTop: `${navbarHeight}px` }}>
            <h1>Content with navbar spacing</h1>
            <p>Current navbar height: {navbarHeight}px</p>
        </div>
    );
}

// Example 2: Using the dedicated hook
export function ExampleComponent2() {
    const navbarHeight = useNavbarHeight();
    
    return (
        <div style={{ marginTop: navbarHeight }}>
            <h1>Content below navbar</h1>
        </div>
    );
}

// Example 3: Using the utility hook with pre-calculated values
export function ExampleComponent3() {
    const navbarOffset = useNavbarOffset();
    
    return (
        <div>
            {/* Full height container minus navbar */}
            <div style={{ height: navbarOffset.height }}>
                <h1>Full height content</h1>
            </div>
            
            {/* Content with top padding */}
            <div style={{ paddingTop: navbarOffset.paddingTop }}>
                <h1>Padded content</h1>
            </div>
            
            {/* Fixed position element below navbar */}
            <div 
                className="fixed w-full bg-white shadow"
                style={{ top: navbarOffset.top }}
            >
                <h1>Fixed element below navbar</h1>
            </div>
        </div>
    );
}

// Example 4: Chat-like layout with proper spacing
export function ChatLayoutExample() {
    const navbarOffset = useNavbarOffset();
    
    return (
        <div className="flex flex-col" style={{ height: navbarOffset.height }}>
            {/* Header */}
            <div className="bg-blue-600 text-white p-4">
                <h1>Chat Header</h1>
            </div>
            
            {/* Messages area - takes remaining space */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                    {/* Messages would go here */}
                    <p>Message 1</p>
                    <p>Message 2</p>
                </div>
            </div>
            
            {/* Input area */}
            <div className="border-t bg-white p-4">
                <input 
                    type="text" 
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
        </div>
    );
}

// Example 5: Responsive sidebar layout
export function SidebarLayoutExample() {
    const navbarOffset = useNavbarOffset();
    
    return (
        <div className="flex" style={{ height: navbarOffset.height }}>
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 border-r">
                <div className="p-4">
                    <h2>Sidebar</h2>
                    <ul className="space-y-2">
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    <h1>Main Content</h1>
                    <p>This content will scroll independently of the sidebar and navbar.</p>
                </div>
            </div>
        </div>
    );
}

/**
 * AVAILABLE UTILITIES:
 * 
 * 1. useChat() - Access full chat context including navbarHeight
 * 2. useNavbarHeight() - Get just the navbar height number
 * 3. useNavbarOffset() - Get pre-calculated CSS values:
 *    - paddingTop: `${navbarHeight}px`
 *    - marginTop: `${navbarHeight}px`
 *    - top: `${navbarHeight}px`
 *    - height: `calc(100vh - ${navbarHeight}px)`
 *    - minHeight: `calc(100vh - ${navbarHeight}px)`
 * 
 * BENEFITS:
 * - Automatic updates when navbar height changes
 * - No need to duplicate height calculation logic
 * - Consistent spacing across all components
 * - Responsive to window resizing and navbar content changes
 */
