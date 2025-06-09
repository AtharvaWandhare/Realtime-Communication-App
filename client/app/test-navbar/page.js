'use client';
import { useNavbarHeight, useNavbarOffset } from "@/contexts/ChatContext";

export default function TestNavbarPage() {
    const navbarHeight = useNavbarHeight();
    const navbarOffset = useNavbarOffset();

    return (
        <div className="p-8" style={{ paddingTop: navbarOffset.paddingTop }}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Navbar Height Test Page</h1>
                
                {/* Display Current Values */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Current Navbar Height</h2>
                        <div className="text-2xl font-mono text-blue-600">
                            {navbarHeight}px
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Navbar Offset Values</h2>
                        <div className="space-y-2 font-mono text-sm">
                            <div><strong>paddingTop:</strong> {navbarOffset.paddingTop}</div>
                            <div><strong>marginTop:</strong> {navbarOffset.marginTop}</div>
                            <div><strong>top:</strong> {navbarOffset.top}</div>
                            <div><strong>height:</strong> {navbarOffset.height}</div>
                            <div><strong>minHeight:</strong> {navbarOffset.minHeight}</div>
                        </div>
                    </div>
                </div>

                {/* Visual Test Containers */}
                <div className="space-y-8">
                    <div className="bg-yellow-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Layout Test 1: Full Height Container</h2>
                        <div 
                            className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold"
                            style={{ height: `calc(100vh - ${navbarOffset.top} - 200px)` }}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">Full Height Container</div>
                                <div className="text-sm opacity-80">
                                    Height: calc(100vh - {navbarOffset.top} - 200px)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-pink-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Layout Test 2: Fixed Top Position</h2>
                        <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                            <div 
                                className="absolute bg-red-500 text-white p-4 rounded shadow-lg"
                                style={{ top: navbarOffset.top }}
                            >
                                <div className="font-semibold">Fixed positioned element</div>
                                <div className="text-sm">Top: {navbarOffset.top}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Layout Test 3: Min Height Container</h2>
                        <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white"
                            style={{ minHeight: navbarOffset.minHeight }}
                        >
                            <div className="text-lg font-semibold mb-2">Min Height Container</div>
                            <div className="text-sm opacity-80">
                                Min Height: {navbarOffset.minHeight}
                            </div>
                            <div className="mt-4 text-sm">
                                This container has a minimum height that ensures it&apos;s always at least as tall as the navbar.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-12 bg-gray-50 p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>• Resize the browser window and observe how the navbar height updates</p>
                        <p>• Navigate between pages to ensure the navbar height is consistent</p>
                        <p>• Check that containers properly respect the navbar offset</p>
                        <p>• Verify that the values update in real-time as you resize</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
