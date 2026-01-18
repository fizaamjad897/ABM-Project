'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Stack, IconButton, Chip } from '@mui/material';
import {
  PlayArrow,
  AutoGraph,
  Security,
  Speed,
  Storage,
  Psychology,
  ArrowForward,
  Lan,
  Dashboard,
  Assessment,
  MenuBook,
  School,
  Menu,
  Settings,
  Dns as DnsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'transparent',
      position: 'relative',
    }}>
      {/* Navigation */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 1000,
        py: 2, px: { xs: 2, md: 6 },
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            p: 1, borderRadius: '8px', bgcolor: '#2563eb', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Lan sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{
            color: '#0f172a',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            display: 'flex', alignItems: 'center', gap: 1
          }}>
            CACHENET <Chip label="v1.0" size="small" sx={{ height: 18, fontWeight: 600, bgcolor: '#eff6ff', color: '#1e40af', fontSize: '9px', border: '1px solid #dbeafe' }} />
          </Typography>
        </Stack>

        <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          <NavAnchor label="Dashboard" href="/dashboard" />
          <NavAnchor label="Analytics" href="/analytics" />
          <NavAnchor label="Docs" href="/docs" />
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="small" sx={{
              borderRadius: '8px',
              textTransform: 'none',
              bgcolor: '#2563eb',
              px: 3,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e40af' }
            }}>
              Open Lab
            </Button>
          </Link>
        </Stack>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: 10 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 850, mx: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              <Chip
                icon={<Settings sx={{ fontSize: '1rem !important' }} />}
                label="System Modeling Engine"
                sx={{
                  fontWeight: 500,
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}
              />
            </Stack>

            <Typography variant="h1" sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              lineHeight: 1.15,
              color: '#0f172a',
              fontWeight: 600,
              letterSpacing: '-1px'
            }}>
              Mastering Distributed <Box component="span" sx={{ color: '#2563eb' }}>Cache Dynamics</Box>
            </Typography>

            <Typography variant="h6" sx={{ color: '#64748b', mb: 5, fontWeight: 400, px: { xs: 2, md: 10 }, lineHeight: 1.6 }}>
              A high-fidelity system modeling framework designed to visualize distributed complexity, testing fault tolerance and consistency in real-time.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{
                    px: 6, py: 2, borderRadius: '12px', bgcolor: '#2563eb',
                    fontSize: '1rem', fontWeight: 600, textTransform: 'none',
                    boxShadow: '0 10px 15px -3px rgba(37,99,235,0.1)',
                    '&:hover': { bgcolor: '#1e40af' }
                  }}
                >
                  Execute Engine
                </Button>
              </Link>
              <Link href="/docs" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 6, py: 2, borderRadius: '12px', borderColor: '#e2e8f0', color: '#1e293b',
                    fontSize: '1rem', fontWeight: 600, textTransform: 'none',
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                  }}
                >
                  Technical Specs
                </Button>
              </Link>
            </Stack>
          </motion.div>
        </Box>

        {/* Study Modules (Features) */}
        <Grid container spacing={3} sx={{ mt: 10 }}>
          {[
            {
              title: 'Core Mechanics',
              desc: 'Monitor L1/L2 hits and misses with visual trackers and eviction alerts.',
              icon: <Storage sx={{ fontSize: 24, color: '#2563eb' }} />,
              tag: 'Module 01'
            },
            {
              title: 'Stress Testing',
              desc: 'Inject "Chaos Monkey" events to observe system resilience and hashing.',
              icon: <Security sx={{ fontSize: 24, color: '#ec4899' }} />,
              tag: 'Module 02'
            },
            {
              title: 'Live Telemetry',
              desc: 'Deep analytics on latency and throughput with clean, academic charts.',
              icon: <AutoGraph sx={{ fontSize: 24, color: '#8b5cf6' }} />,
              tag: 'Module 03'
            },
            {
              title: 'AI Tutoring',
              desc: 'Ask Gemini for real-time explanations of simulation emergent behaviors.',
              icon: <Psychology sx={{ fontSize: 24, color: '#eab308' }} />,
              tag: 'Module 04'
            }
          ].map((feature, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Paper sx={{
                  p: 4, height: '100%', position: 'relative', borderRadius: '24px',
                  border: '1px solid #f1f5f9', bgcolor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>{feature.tag}</Typography>
                      <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#f8fafc', display: 'flex' }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1.1rem' }}>{feature.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* System Schematic Preview */}
        <Box sx={{ mt: 15, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 600, letterSpacing: 3 }}>SYSTEM SCHEMATIC</Typography>
          <Typography variant="h2" sx={{ mt: 2, mb: 8, fontWeight: 600, letterSpacing: '-1px' }}>Core Architecture</Typography>

          <Paper sx={{
            p: { xs: 4, md: 8 }, maxWidth: 1000, mx: 'auto', borderRadius: '32px', border: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)'
          }}>
            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: 'left' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>System Optimization</Typography>
                <Stack spacing={3}>
                  {[
                    { title: 'Parallel Processing', text: 'Multi-threaded worker nodes for high-throughput modeling.', icon: <Lan /> },
                    { title: 'Affinity Routing', text: 'Mathematical distribution for node data consistency.', icon: <Security /> },
                    { title: 'Resource Flushing', text: 'Industrial memory management and eviction.', icon: <Storage /> }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2.5 }}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#eff6ff', color: '#2563eb', height: 'fit-content' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 400 }}>{item.text}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{
                  p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320,
                  position: 'relative', overflow: 'hidden'
                }}>
                  <Box className="bg-grid-blue" sx={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                  <Stack direction="row" spacing={2.5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <SchematicBlock icon={<Lan />} name="L-Balancer" color="#2563eb" />
                    <ArrowForward sx={{ color: '#cbd5e1' }} />
                    <Stack spacing={2}>
                      <SchematicBlock icon={<Storage />} name="Node-01" color="#10b981" />
                      <SchematicBlock icon={<Storage />} name="Node-02" color="#10b981" />
                    </Stack>
                    <ArrowForward sx={{ color: '#cbd5e1' }} />
                    <SchematicBlock icon={<DnsIcon />} name="Database" color="#f59e0b" />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 6, textAlign: 'center', borderTop: '1px solid #f1f5f9', bgcolor: 'rgba(255,255,255,0.8)' }}>
        <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
          CacheNet Modeling Platform © 2026 • industrial-v1.0.4
        </Typography>
      </Box>
    </Box>
  );
}

function NavAnchor({ label, href }: { label: string, href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, '&:hover': { color: '#2563eb' } }}>
        {label}
      </Typography>
    </Link>
  );
}

function SchematicBlock({ icon, name, color }: { icon: any, name: string, color: string }) {
  return (
    <Box sx={{
      p: 1.5, borderRadius: '12px', bgcolor: 'white',
      border: `1px solid #f1f5f9`,
      borderLeft: `4px solid ${color}`,
      width: 100, height: 80, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', gap: 0.5,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
    }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontSize: '9px', color: '#475569', fontWeight: 600 }}>{name}</Typography>
    </Box>
  );
}
