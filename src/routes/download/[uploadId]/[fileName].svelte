<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { BACKEND_URL } from '/src/urls';

	const uploadId = $page.params.uploadId;
	const fileName = $page.params.fileName;

	onMount(() => {
		if (uploadId && fileName) {
			window.location.href = `${BACKEND_URL}/files/${uploadId}/${fileName}`;
		}
	});
</script>

<p>You will be redirected...</p>
