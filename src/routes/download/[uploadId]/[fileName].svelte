<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const BACKEND_URL = 'http://localhost:3100';
	// const BACKEND_URL = 'http://vollsm.art:5200';
	const uploadId = $page.params.uploadId;
	const fileName = $page.params.fileName;

	onMount(() => {
		if (uploadId && fileName) {
			window.location.href = `${BACKEND_URL}/files/${uploadId}/${fileName}`;
		}
	});
</script>

<p>You will be redirected...</p>
