'use client';
import { Flex, Heading, Spacer, Box } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import Link from 'next/link';

export function Header() {
  return (
    <Flex
      as="header"
      align="center"
      px={{ base: 4, md: 8 }}
      py={3}
      minH={16}
      bg="transparent"
      borderBottom="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: 'gray.700' }}
      position="sticky"
      top={0}
      zIndex={10}
      gap={4}
    >
      <Heading size="md">
        <Link href="/">ToDoアプリ</Link>
      </Heading>
      <Spacer />
      <Box>
        <ColorModeButton aria-label="カラーモード切替" />
      </Box>
    </Flex>
  );
}
