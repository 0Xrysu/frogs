'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiDocsSkeleton } from '@/components/SkeletonLoader';
import { FiChevronDown } from 'react-icons/fi';

export default function DocsPage() {
  const [docs, setDocs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openJson, setOpenJson] = useState<{ [key: string]: boolean }>({});
  const [testResult, setTestResult] = useState<{ [key: string]: any }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const [frogNames, setFrogNames] = useState<string[]>([]);
  const [frogNamesLoading, setFrogNamesLoading] = useState(true);
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string }>({});
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => { setDocs(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        const names = (data.images || []).map((img: { filename: string }) => {
          return (img.filename || '')
            .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
        }).filter(Boolean);
        setFrogNames(names);
      })
      .finally(() => setFrogNamesLoading(false));
  }, []);

  const toggleJson = (key: string) => {
    setOpenJson(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runTest = async (endpoint: any) => {
    const key = endpoint.path;
    setTesting(prev => ({ ...prev, [key]: true }));
    try {
      let url = `/api${endpoint.path}`;
      if (endpoint.path.includes('[name]')) {
        const selected = selectedNames[key];
        if (!selected) {
          setTestResult(prev => ({ ...prev, [key]: { error: 'No frog selected' } }));
          return;
        }
        url = url.replace('[name]', encodeURIComponent(selected));
      }
      const res = await fetch(url);
      if (endpoint.path === '/images/[name]') {
        setTestResult(prev => ({ ...prev, [key]: { status: res.status, image: url } }));
        return;
      }
      const data = await res.json();
      setTestResult(prev => ({ ...prev, [key]: { status: res.status, data } }));
    } catch {
      setTestResult(prev => ({ ...prev, [key]: { error: 'Request failed' } }));
    } finally {
      setTesting(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-12 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          </div>
        </div>
        <ApiDocsSkeleton />
        <Footer />
      </main>
    );
  }

  if (!docs) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Failed to load docs</div>
      </main>
    );
  }

  const orderedPaths = [
    '/frogs', '/frogs/[name]', '/frogs/add',
    '/metadata', '/metadata/[name]',
    '/images', '/images/[name]',
    '/docs', '/health',
  ];

  const endpoints = orderedPaths
    .map(path => docs.endpoints.find((e: any) => e.path === path))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="heading-5xl text-foreground">{docs.title}</h1>
          <p className="text-muted-foreground mt-2">{docs.description}</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        <section className="mb-12">
          <h2 className="heading-2xl mb-4">Base URL</h2>
          <code className="block bg-muted p-4 rounded text-foreground">{docs.baseUrl}</code>
        </section>

        <section className="mb-12">
          <h2 className="heading-2xl mb-6">Endpoints</h2>

          {endpoints.map((endpoint: any, idx: number) => {
            const key = endpoint.path;
            return (
              <div key={idx} className="mb-8 border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  <span className={`px-2 py-1 rounded text-sm font-mono mr-2
                    ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                    ${endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                  `}>
                    {endpoint.method}
                  </span>
                  {endpoint.path}
                </h3>

                <p className="text-muted-foreground mb-4">{endpoint.description}</p>

                {endpoint.path.includes('[name]') && (
                  frogNamesLoading ? (
                    <div className="mb-4 h-9 bg-muted rounded animate-pulse w-full" />
                  ) : (
                    <div className="relative mb-4">
                      <button
                        type="button"
                        onClick={() => setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-left flex items-center justify-between text-sm"
                      >
                        <span className={selectedNames[key] ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedNames[key] || 'Select frog...'}
                        </span>
                        <FiChevronDown className={`text-muted-foreground transition-transform ${openDropdowns[key] ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdowns[key] && (
                        <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
                          <div className="max-h-40 overflow-y-auto">
                            {frogNames.length === 0 ? (
                              <div className="text-center text-muted-foreground py-3">Empty</div>
                            ) : (
                              frogNames.map((name, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  className={`block w-full text-left px-3 py-2 hover:bg-muted text-sm text-foreground ${selectedNames[key] === name ? 'bg-muted' : ''}`}
                                  onClick={() => {
                                    setSelectedNames(prev => ({ ...prev, [key]: name }));
                                    setOpenDropdowns(prev => ({ ...prev, [key]: false }));
                                  }}
                                >
                                  {name}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {endpoint.params && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-foreground">Params</p>
                    <code className="block bg-muted p-3 rounded text-xs text-foreground">
                      {JSON.stringify(endpoint.params, null, 2)}
                    </code>
                  </div>
                )}

                {endpoint.requestBody && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-foreground">Request</p>
                    <code className="block bg-muted p-3 rounded text-xs text-foreground">
                      {endpoint.requestBody}
                    </code>
                  </div>
                )}

                {endpoint.response && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-foreground">Response</p>
                      <button onClick={() => toggleJson(key)} className="text-xs text-blue-600">
                        {openJson[key] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {openJson[key] && (
                      <div className="bg-muted p-3 rounded max-h-64 overflow-auto">
                        <code className="text-xs whitespace-pre text-foreground">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {endpoint.errors && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-foreground">Errors</p>
                    <div className="space-y-2 text-xs">
                      {endpoint.errors.map((err: any, i: number) => (
                        <div key={i} className="bg-destructive/10 border border-destructive/20 p-2 rounded">
                          <span className="font-mono text-destructive">{err.code}</span>{' '}{err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => runTest(endpoint)}
                    className="text-xs bg-foreground text-background px-3 py-1 rounded"
                  >
                    {testing[key] ? 'Testing...' : 'Run Test'}
                  </button>

                  {testResult[key] && endpoint.path === '/images/[name]' && testResult[key].status === 200 && (
                    <img src={testResult[key].image} className="mt-3 rounded border border-border max-h-64" alt="test result" />
                  )}

                  {testResult[key] && endpoint.path !== '/images/[name]' && (
                    <div className="mt-3 bg-muted p-3 rounded text-xs max-h-64 overflow-auto">
                      <div className="mb-1 font-semibold text-foreground">
                        Status: {testResult[key].status}
                      </div>
                      <code className="whitespace-pre text-foreground">
                        {JSON.stringify(testResult[key].data || testResult[key], null, 2)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="mb-12">
          <h2 className="heading-2xl mb-4">
            Conservation Status (IUCN Red List)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-4 py-2 text-foreground">Status</th>
                  <th className="border border-border px-4 py-2 text-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['EX', 'Extinct'], ['EW', 'Extinct in the Wild'],
                  ['CR', 'Critically Endangered'], ['EN', 'Endangered'],
                  ['VU', 'Vulnerable'], ['NT', 'Near Threatened'], ['LC', 'Least Concern'],
                ].map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="border border-border px-4 py-2 text-foreground">{code}</td>
                    <td className="border border-border px-4 py-2 text-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
